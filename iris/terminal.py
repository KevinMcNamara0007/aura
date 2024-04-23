from utilities import customized_response


def term():
    user_input = input("Ask a question or enter 1 to exit:\n")
    while user_input != '1':
        if user_input == '1':
            break
        else:
            try:
                response = customized_response(user_input)
                print("\nresponse:\n" + response + "\n")
                user_input = input("Ask another question or enter 1 to exit:\n")
            except Exception:
                print("failed to get a response\n")
                user_input = input("Ask another question or enter 1 to exit:\n")


term()
