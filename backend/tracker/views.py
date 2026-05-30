from django.http import HttpResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.db.models import Sum
from django.contrib.auth.models import User

from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Expense
from .serializers import ExpenseSerializer

import openpyxl
import json


def index(request):
    if request.method == "POST":
        title = request.POST.get("title")
        amount = request.POST.get("amount")
        category = request.POST.get("category")

        if title and amount and category:
            Expense.objects.create(
                title=title,
                amount=amount,
                category=category
            )
            return redirect("index")

    expenses = Expense.objects.all().order_by("-date")

    labels = [expense.title for expense in expenses]
    data = [float(expense.amount) for expense in expenses]
    categories = [expense.category for expense in expenses]

    total_amount = Expense.objects.aggregate(Sum("amount"))["amount__sum"] or 0

    context = {
        "expenses": expenses,
        "labels": json.dumps(labels),
        "data": json.dumps(data),
        "categories": json.dumps(categories),
        "total_amount": total_amount,
    }

    return render(request, "index.html", context)


def delete_expense(request, id):
    expense = get_object_or_404(Expense, id=id)
    expense.delete()
    return redirect("index")


class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all().order_by("-id")
    serializer_class = ExpenseSerializer


def export_excel(request):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Expenses"

    ws.append(["S.No", "Title", "Amount", "Category", "Date"])

    expenses = Expense.objects.all().order_by("-id")

    for index, exp in enumerate(expenses, start=1):
        ws.append([
            index,
            exp.title,
            float(exp.amount),
            exp.category,
            exp.date.strftime("%Y-%m-%d"),
        ])

    response = HttpResponse(
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

    response["Content-Disposition"] = 'attachment; filename="expenses.xlsx"'

    wb.save(response)
    return response


@api_view(["POST"])
def register_user(request):
    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response(
            {"error": "Username and password are required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(username=username).exists():
        return Response(
            {"error": "Username already exists"},
            status=status.HTTP_400_BAD_REQUEST
        )

    User.objects.create_user(username=username, password=password)

    return Response(
        {"message": "User created successfully"},
        status=status.HTTP_201_CREATED
    )