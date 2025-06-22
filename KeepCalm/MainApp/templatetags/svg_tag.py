from django import template
from django.contrib.staticfiles import finders

register = template.Library()

@register.simple_tag
def inline_svg(path):
    absolute_path = finders.find(path)

    if not absolute_path:
        return f'<!-- SVG not found: {path} -->'

    with open(absolute_path, 'r', encoding='utf-8') as svg_file:
        return svg_file.read()