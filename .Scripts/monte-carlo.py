import random
import scipy
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np

def raw_data(path):
    data_frame = pd.read_excel(path, 0)
    print(data_frame)
raw_data('./raw data (heatloss test) 2kW, 10CMM (1).xlsx')

