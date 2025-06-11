import sys

positive_words = ['좋다', '만족', '예쁘다', '감사', '추천', '맘에 들어', '빠르다', '훌륭']
negative_words = ['별로', '불만', '나쁘다', '실망', '늦다', '망함', '최악', '짜증']

def analyze_sentiment(text):
    pos_score = sum(word in text for word in positive_words)
    neg_score = sum(word in text for word in negative_words)

    if pos_score > neg_score:
        return 'positive'
    elif neg_score > pos_score:
        return 'negative'
    else:
        return 'neutral'

if __name__ == "__main__":
    input_text = ' '.join(sys.argv[1:])  # 명령줄 인자로 텍스트 받기
    result = analyze_sentiment(input_text)
    print(result)