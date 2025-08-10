
def check_for_errors(test_string, match):
    """
    Function to check for errors in match(str) with the input test_string(str)
    :param test_string: string to test against the match
    :param match: string the test_string is compared to
    :return: a dict with:
    'is_equal': False if any mismatch or length difference.
    'length_mismatch': True if lengths differ.
    'mismatches': list of (index, test_char, match_char)
    """
    n = len(test_string)
    m = len(match)
    length = min(n, m)
    mismatches = []
    length_mismatch = n != m

    for i in range(length):
        if test_string[i] != match[i]:
            mismatches.append((i, test_string[i], match[i]))
    if length_mismatch:
        for i in range(length, max(n, m)):
            char_test = test_string[i] if i < n else None
            char_match = match[i] if i < m else None
            mismatches.append((i, char_test, char_match))
    return {"mismatches": mismatches, "length_mismatch": length_mismatch, "is_equal": not mismatches}

#Simple Test Check
a = "apple is gooder"
b = "apple is gooder"
result = check_for_errors(a, b)
print(result)