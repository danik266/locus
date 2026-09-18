from pathlib import Path
import sys

from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader, simpleSplit
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'output/pdf/continue-sixsevensquad-case2.pdf'
FONT_DIR = Path('/System/Library/Fonts/Supplemental')
WIDTH, HEIGHT = 960, 540
PLUM = HexColor('#73566f')
DARK = HexColor('#29262c')
IVORY = HexColor('#faf9f6')
MUTED = HexColor('#746e78')


def setup_fonts():
    pdfmetrics.registerFont(TTFont('Continue', str(FONT_DIR / 'Arial.ttf')))
    pdfmetrics.registerFont(TTFont('ContinueBold', str(FONT_DIR / 'Arial Bold.ttf')))


def lines(pdf, text, x, top, width, size=23, leading=32, bold=False, color=DARK):
    pdf.setFillColor(color)
    pdf.setFont('ContinueBold' if bold else 'Continue', size)
    for line in simpleSplit(text, 'ContinueBold' if bold else 'Continue', size, width):
        pdf.drawString(x, top, line)
        top -= leading
    return top


def frame(pdf, number, title, dark=False):
    pdf.setFillColor(PLUM if dark else IVORY)
    pdf.rect(0, 0, WIDTH, HEIGHT, fill=1, stroke=0)
    foreground = IVORY if dark else DARK
    pdf.setFillColor(foreground)
    pdf.setFont('ContinueBold', 13)
    pdf.drawString(64, 498, 'CONTINUE  /  SIXSEVENSQUAD')
    pdf.setFont('Continue', 13)
    pdf.drawRightString(WIDTH - 64, 498, f'LOCUSCASE2  ·  {number:02d}/08')
    lines(pdf, title, 64, 404, WIDTH - 128, size=48, leading=58, bold=True, color=foreground)


def body(pdf, paragraphs, dark=False, start=285):
    color = IVORY if dark else DARK
    for text in paragraphs:
        start = lines(pdf, text, 68, start, WIDTH - 140, size=23, leading=31, color=color) - 28


def campus_image(pdf, path, x, y, width, height):
    reader = ImageReader(str(ROOT / path))
    image_width, image_height = reader.getSize()
    scale = min(width / image_width, height / image_height)
    actual_width, actual_height = image_width * scale, image_height * scale
    pdf.drawImage(reader, x + (width - actual_width) / 2, y + (height - actual_height) / 2,
                  width=actual_width, height=actual_height)


def main():
    setup_fonts()
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    pdf = canvas.Canvas(str(OUTPUT), pagesize=(WIDTH, HEIGHT), pageCompression=1)
    pdf.setTitle('Continue — SixSevenSquad — LOCUS Case 2')

    frame(pdf, 1, 'Continue.', dark=True)
    lines(pdf, 'Понятный маршрут поступления', 68, 287, 810, size=34, leading=44, color=IVORY)
    lines(pdf, 'От интересов и выбора программы до следующего действия.', 68, 233, 800,
          size=21, leading=29, color=IVORY)
    lines(pdf, 'SixSevenSquad · команда из трёх человек', 68, 90, 800, size=17, color=IVORY)
    pdf.showPage()

    frame(pdf, 2, 'Абитуриент теряется среди отдельных решений')
    body(pdf, [
        'Программы, экзамены, документы и сроки находятся на разных сайтах.',
        'Даже после выбора вуза часто непонятно, что делать сегодня.',
    ])
    pdf.showPage()

    frame(pdf, 3, 'Continue соединяет выбор и подготовку', dark=True)
    body(pdf, [
        'Шесть шагов анкеты → диагностика → объяснимый подбор.',
        'Сравнение двух программ → личный план → отметка прогресса.',
    ], dark=True)
    pdf.showPage()

    frame(pdf, 4, 'Подбор показывает причины и ограничения')
    body(pdf, [
        'Профиль: 11 класс, технологии, бюджет 12 000 € в год, IELTS 6.',
        'При открытой стране пользователь видит несколько реальных программ и ссылки на источники.',
    ])
    pdf.showPage()

    frame(pdf, 5, 'Сравнение помогает принять решение', dark=True)
    body(pdf, [
        'Два выбранных варианта сопоставляются по стоимости, языку и требованиям.',
        'Неизвестные данные отмечены. Балл подбора не выдаётся за шанс поступления.',
    ], dark=True)
    pdf.showPage()

    frame(pdf, 6, 'План начинается с одного действия')
    body(pdf, [
        'Для выбранной программы видны ближайший шаг, его источник и восемь этапов.',
        'Прогресс сохраняется в аккаунте; изменение бюджета меняет рекомендации.',
    ])
    pdf.showPage()

    frame(pdf, 7, 'Источники важнее ложной точности')
    lines(pdf, 'Проверенные страницы вузов, честная пометка неизвестных условий и фотографии с источниками.',
          68, 300, 820, size=21, leading=30)
    campus_image(pdf, 'public/universities/delft.jpg', 64, 78, 260, 147)
    campus_image(pdf, 'public/universities/oxford.jpg', 350, 78, 260, 147)
    campus_image(pdf, 'public/universities/uva.jpg', 636, 78, 260, 147)
    pdf.setFillColor(MUTED)
    pdf.setFont('Continue', 11)
    for x, caption in [(64, 'TU Delft'), (350, 'Oxford'), (636, 'University of Amsterdam')]:
        pdf.drawString(x, 60, caption)
    pdf.drawRightString(896, 60, 'Wikimedia Commons')
    pdf.showPage()

    frame(pdf, 8, 'Маршрут можно проверить самостоятельно', dark=True)
    body(pdf, [
        'Рабочий сайт: continue.46.101.134.38.sslip.io',
        'SixSevenSquad · кейс №2 · LOCUSCASE2',
    ], dark=True)
    pdf.showPage()

    pdf.save()
    print(OUTPUT)


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print(error, file=sys.stderr)
        raise
