# Library imports.
import pickle
import pandas as pd
from fastapi import FastAPI
from server.models import ModelInput

# Opening the PKL file containing the model.
with open("models/trained_model-0.1.0.pkl", "rb") as f:
    model = pickle.load(f)

# We instantiate the application, generating an object called app to use FastAPI.
app = FastAPI()

# Here, we create the FastAPI endpoint, instantiated in app, HTTP POST method.
@app.post("/predict")

# We choose the parameter "data" to store what is sent by the user.
# Therefore, when doing data: ModelInput, we are saying that what is sent by the user must
# have the ModelInput schema. It takes the place of a data type.
# In the same way we do name: str, we are saying that name has a string type schema,
# here we define a schema using a class.
def predict(data: ModelInput):

    # We create a dataframe based on what the user sends.
    # model_dump is a BaseModel method. It collects the object (from the class) and transforms it into
    # a regular python dictionary.
    input_df = pd.DataFrame([data.model_dump()])

    # We calculate the probabilities.
    proba_list = model.predict_proba(input_df)

    # Multi-target predict_proba gives us n arrays, one per target.
    # Each array contains the probability of the negative class followed by the positive class.
    # Therefore, y_proba[0] gives us the probabilities of the first target.
    # y_proba[0][0] gives us the probabilities 0 and 1 of the first target for the first observation.
    # y_proba[0][0][1] gives us the probability of getting 1 (first negative class, then positive).

    list_target =["personal_loan", 
                "mortgage",
                "auto_loan",
                "credit_card",
                "overdraft", 
                "payroll_loan",
                "student_loan",
                "working_capital_loan"]

    # Creates an empty dictionary.
    dict_probas = dict()

    # For each target and probability among the target + probability pairs,
    # adds to the dictionary the target name as key and the probability as value.
    for target, proba in zip(list_target, proba_list):
        dict_probas[target] = float(proba[0][1])

    # Returns the dictionary.
    return (dict_probas)
