from pathlib import Path
import random

from PIL import Image, ImageDraw, ImageFilter, ImageOps


WIDTH, HEIGHT = 1024, 768
random.seed(42)


def make_surface():
    image = Image.effect_noise((WIDTH, HEIGHT), 28).convert("L")
    image = ImageOps.autocontrast(image)
    draw = ImageDraw.Draw(image)
    for _ in range(90):
        x = random.randint(30, WIDTH - 30)
        y = random.randint(30, HEIGHT - 30)
        radius = random.randint(8, 48)
        shade = random.randint(70, 190)
        draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=shade, outline=225, width=3)
        inner = int(radius * 0.7)
        draw.ellipse((x - inner, y - inner, x + inner, y + inner), outline=35, width=4)
    return image.filter(ImageFilter.GaussianBlur(0.7))


output = Path(__file__).resolve().parents[1] / "public"
source = make_surface()
reference = source.transform((WIDTH, HEIGHT), Image.Transform.AFFINE, (0.985, 0.018, -12, -0.018, 0.985, 16), resample=Image.Resampling.BICUBIC)
source.save(output / "sample-lunar-source.png")
reference.save(output / "sample-lunar-reference.png")