from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.models import user, profile, meal_plan, nutrition_log
from app.api import auth, profile as profile_api, meal_plans, logs, benchmark

# Ensure database tables are created
Base.metadata.create_all(bind=engine)

def seed_default_users():
    """Ensure database has default user and profile on fresh deployments (e.g. Render ephemeral containers)"""
    from app.core.database import SessionLocal
    from app.core.security import hash_password
    from app.agents.profile_analyzer import calculate_bmr, ACTIVITY_MULTIPLIERS, GOAL_ADJUSTMENTS

    db = SessionLocal()
    try:
        if db.query(user.User).count() == 0:
            demo = user.User(
                email="demo@nutrition.ai",
                hashed_password=hash_password("DemoPassword2025!"),
                full_name="Saurav Sharma"
            )
            db.add(demo)
            db.commit()
            db.refresh(demo)

            bmr = calculate_bmr(60.0, 173.0, 21, "male")
            tdee = round(bmr * ACTIVITY_MULTIPLIERS.get("moderately_active", 1.55), 1)
            target_cal = round(tdee + GOAL_ADJUSTMENTS.get("maintenance", 0.0), 1)

            prof = profile.DietaryProfile(
                user_id=demo.id,
                age=21,
                gender="male",
                weight=60.0,
                height=173.0,
                activity_level="moderately_active",
                health_goal="maintenance",
                diet_type="balanced",
                allergies="",
                bmr=bmr,
                tdee=tdee,
                target_calories=target_cal,
                target_protein_g=round(target_cal * 0.30 / 4.0, 1),
                target_carbs_g=round(target_cal * 0.40 / 4.0, 1),
                target_fats_g=round(target_cal * 0.30 / 9.0, 1)
            )
            db.add(prof)
            db.commit()
    except Exception as e:
        print(f"Startup seeder notice: {e}")
        db.rollback()
    finally:
        db.close()

seed_default_users()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "Enterprise-Grade AI Nutrition Planner (FoodTech Sector Automation). "
        "Autonomous Multi-Agent architecture using LangGraph, FastAPI, and Next.js."
    ),

    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(profile_api.router, prefix=settings.API_V1_STR)
app.include_router(meal_plans.router, prefix=settings.API_V1_STR)
app.include_router(logs.router, prefix=settings.API_V1_STR)
app.include_router(benchmark.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "status": "online",
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": f"{settings.API_V1_STR}/docs"
    }


@app.get("/health")
@app.get(f"{settings.API_V1_STR}/health")
def health_check():
    return {"status": "healthy", "service": "backend-api"}
