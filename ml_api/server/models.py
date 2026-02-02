# Import.
from pydantic import BaseModel

# We will create a class only to validate that the input has the required data types.
# FastAPI uses pydantic; it does not validate each feature individually, it
# instantiates everything into a single object called data.

# NOTE: When someone sends a JSON object to the server created via FastAPI,
# FastAPI does sent_data = ModelInput(age=29, sex=1, ...), THEN THE JSON DIES
# AND BECOMES A LIVE OBJECT INSIDE PYTHON.

# NOTE: When we create the class, we put BaseModel inside the parentheses, making
# the ModelInput class INHERIT (inheritance) all attributes and methods from BaseModel,
# which is a Pydantic class.

class ModelInput(BaseModel):
    age: int
    sex: int
    education: int
    has_children: int
    has_property: int
    has_car: int
    ever_loan: int
    loan_paid: int
    annual_salary: int
    invested_amount: int
