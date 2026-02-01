from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from .. import crud, schemas

router = APIRouter(prefix="/tasks", tags=["Tasks"])


# ─────────────────────────────────────────────────────────────
# Admin: управление шаблонами заданий
# ─────────────────────────────────────────────────────────────
@router.get("/", response_model=List[schemas.TaskOut])
def list_tasks(active_only: bool = True, db: Session = Depends(get_db)):
    """Получить список всех заданий."""
    return crud.get_all_tasks(db, active_only=active_only)


@router.post("/", response_model=schemas.TaskOut, status_code=201)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    """Создать новое задание."""
    return crud.create_task(db, task)


@router.get("/{task_id}", response_model=schemas.TaskOut)
def get_task(task_id: int, db: Session = Depends(get_db)):
    """Получить задание по ID."""
    task = crud.get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.patch("/{task_id}", response_model=schemas.TaskOut)
def update_task(task_id: int, data: schemas.TaskUpdate, db: Session = Depends(get_db)):
    """Обновить задание."""
    task = crud.get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return crud.update_task(db, task, data)


@router.delete("/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    """Удалить задание."""
    task = crud.get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    crud.delete_task(db, task)


# ─────────────────────────────────────────────────────────────
# User: прогресс по заданиям
# ─────────────────────────────────────────────────────────────
@router.get("/user/{user_id}", response_model=List[schemas.UserTaskWithDetails])
def get_user_tasks(
    user_id: int,
    task_type: Optional[str] = Query(None, description="Фильтр по типу: daily или weekly"),
    db: Session = Depends(get_db),
):
    """Получить все задания пользователя с прогрессом."""
    user = crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return crud.get_user_tasks_with_details(db, user_id, task_type=task_type)


@router.post("/user/{user_id}/claim", response_model=schemas.UserTaskOut)
def claim_task_reward(user_id: int, req: schemas.ClaimTaskRequest, db: Session = Depends(get_db)):
    """Забрать награду за выполненное задание."""
    user = crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    task = crud.get_task_by_id(db, req.task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    user_task = crud.claim_task_reward(db, user, task)
    if not user_task:
        raise HTTPException(status_code=400, detail="Cannot claim reward (not completed or already claimed)")

    return user_task


# ─────────────────────────────────────────────────────────────
# Admin: ручной сброс заданий (для тестирования)
# ─────────────────────────────────────────────────────────────
@router.post("/reset/{task_type}")
def reset_tasks(task_type: str, db: Session = Depends(get_db)):
    """Сбросить прогресс заданий указанного типа (daily/weekly)."""
    if task_type not in ("daily", "weekly"):
        raise HTTPException(status_code=400, detail="task_type must be 'daily' or 'weekly'")
    
    deleted = crud.reset_tasks_for_period(db, task_type)
    return {"message": f"Reset {task_type} tasks", "deleted_records": deleted}
