"""Chalkboard math explainer clips for 'Math 140 — AI vs. the Human Brain'.

Render with `npm run manim` (see render.sh). Uses Pango Text only (no LaTeX).
Frame is 14.22 x 8 units at 1280x720 (~90 px / unit). Keep content within
x in [-6.4, 6.4], y in [-3.3, 3.3] for >= 60 px margins.
"""

import numpy as np
from manim import *  # noqa: F401,F403

BOARD = "#24543f"
CHALK = "#fffdf4"
YELLOW_C = "#ffd23f"
PINK_C = "#ff5fa2"
CYAN_C = "#22d3ee"
ORANGE_C = "#ff8c1a"
GREEN_C = "#3ddc84"
FONT = "Chalkboard SE"
SW = 7  # standard stroke width

config.background_color = BOARD


def T(s, size=44, color=CHALK, **kw):
    return Text(s, font=FONT, font_size=size, color=color, **kw)


def fit(mob, max_w):
    if mob.width > max_w:
        mob.scale_to_fit_width(max_w)
    return mob


def angle_of(v):
    return np.arctan2(v[1], v[0])


class Board(Scene):
    def setup(self):
        self.camera.background_color = BOARD


# ---------------------------------------------------------------------------
class Construction(Board):
    def construct(self):
        r = 2.1
        A = np.array([-r / 2, 0.45, 0])
        B = np.array([r / 2, 0.45, 0])
        C = np.array([0, 0.45 + r * np.sqrt(3) / 2, 0])

        ab = Line(A, B, color=CHALK, stroke_width=SW)
        dA = Dot(A, radius=0.09, color=CHALK)
        dB = Dot(B, radius=0.09, color=CHALK)
        lA = T("A", 40).next_to(A, DL, buff=0.12)
        lB = T("B", 40).next_to(B, DR, buff=0.12)

        self.play(Create(ab), FadeIn(dA, dB), run_time=0.6)
        self.play(FadeIn(lA, lB), run_time=0.25)

        # compass sweeps: circle about A starting at B, circle about B starting at A
        cA = Arc(radius=r, start_angle=0, angle=TAU, arc_center=A,
                 color=CHALK, stroke_width=5, stroke_opacity=0.75)
        cB = Arc(radius=r, start_angle=PI, angle=-TAU, arc_center=B,
                 color=CHALK, stroke_width=5, stroke_opacity=0.75)
        armA = Line(A, B, color=ORANGE_C, stroke_width=4)
        armB = Line(B, A, color=ORANGE_C, stroke_width=4)

        self.add(armA)
        armA.add_updater(lambda m: m.put_start_and_end_on(A, cA.get_end()))
        self.play(Create(cA), run_time=0.8, rate_func=linear)
        armA.clear_updaters()
        self.remove(armA)

        self.add(armB)
        armB.add_updater(lambda m: m.put_start_and_end_on(B, cB.get_end()))
        self.play(Create(cB), run_time=0.8, rate_func=linear)
        armB.clear_updaters()
        self.remove(armB)

        dC = Dot(C, radius=0.11, color=YELLOW_C)
        lC = T("C", 40, YELLOW_C).next_to(C, UP, buff=0.15)
        self.play(GrowFromCenter(dC), FadeIn(lC), run_time=0.3)

        ac = Line(A, C, color=YELLOW_C, stroke_width=SW + 1)
        bc = Line(B, C, color=YELLOW_C, stroke_width=SW + 1)
        self.play(Create(ac), Create(bc), ab.animate.set_color(YELLOW_C), run_time=0.6)

        tri = Polygon(A, B, C, stroke_width=0, fill_color=YELLOW_C, fill_opacity=0.25)
        label = T("Equilateral triangle", 50, YELLOW_C).move_to([0, -2.75, 0])
        self.add(tri)
        self.bring_to_front(ab, ac, bc, dA, dB, dC)
        self.play(FadeIn(tri), Write(label), run_time=0.7)
        self.wait(2.6)


# ---------------------------------------------------------------------------
class AngleProof(Board):
    def construct(self):
        L = np.array([-3.2, -1.5, 0])
        R = np.array([3.2, -1.5, 0])
        Tp = np.array([-0.7, 1.55, 0])

        tri = Polygon(L, R, Tp, color=CHALK, stroke_width=SW)
        self.play(Create(tri), run_time=0.7)

        thA = angle_of(Tp - L)          # direction L->T
        phB = angle_of(Tp - R)          # direction R->T (obtuse, ~2.x rad)
        rad = 0.6

        def arc(center, start, sweep, color):
            return Arc(radius=rad, start_angle=start, angle=sweep, arc_center=center,
                       color=color, stroke_width=SW)

        def lab(center, start, sweep, s, color, d=1.05):
            mid = start + sweep / 2
            return T(s, 42, color, slant=ITALIC).move_to(
                center + d * np.array([np.cos(mid), np.sin(mid), 0]))

        a_arc, a_lab = arc(L, 0, thA, PINK_C), lab(L, 0, thA, "a", PINK_C)
        b_arc, b_lab = arc(R, phB, PI - phB, CYAN_C), lab(R, phB, PI - phB, "b", CYAN_C)
        c_start, c_sweep = thA - PI, phB - thA
        c_arc, c_lab = arc(Tp, c_start, c_sweep, YELLOW_C), lab(Tp, c_start, c_sweep, "c", YELLOW_C)

        self.play(LaggedStart(
            AnimationGroup(Create(a_arc), FadeIn(a_lab)),
            AnimationGroup(Create(b_arc), FadeIn(b_lab)),
            AnimationGroup(Create(c_arc), FadeIn(c_lab)),
            lag_ratio=0.4), run_time=0.9)

        par = DashedLine([-5.6, Tp[1], 0], [5.2, Tp[1], 0], color=CHALK,
                         stroke_width=5, dash_length=0.22)
        self.play(Create(par), run_time=0.6)

        # alternate interior angles copied up to the parallel line
        a2_arc = arc(Tp, -PI, thA, PINK_C)
        a2_lab = lab(Tp, -PI, thA, "a", PINK_C, d=1.0)
        b2_arc = arc(Tp, phB - PI, PI - phB, CYAN_C)
        b2_lab = lab(Tp, phB - PI, PI - phB, "b", CYAN_C, d=1.0)
        self.play(TransformFromCopy(a_arc, a2_arc), TransformFromCopy(a_lab, a2_lab),
                  TransformFromCopy(b_arc, b2_arc), TransformFromCopy(b_lab, b2_lab),
                  run_time=1.0)

        straight = T("a straight line = 180°", 32, CHALK).move_to([3.4, Tp[1] + 0.45, 0])
        eq = VGroup(
            T("a", 60, PINK_C, slant=ITALIC), T("+", 60), T("b", 60, CYAN_C, slant=ITALIC),
            T("+", 60), T("c", 60, YELLOW_C, slant=ITALIC), T("= 180°", 60),
        ).arrange(RIGHT, buff=0.28).move_to([0, -2.65, 0])
        self.play(FadeIn(straight), Write(eq), run_time=0.7)
        box = SurroundingRectangle(eq, color=YELLOW_C, buff=0.18, stroke_width=5,
                                   corner_radius=0.15)
        self.play(Create(box), run_time=0.3)
        self.wait(2.6)


# ---------------------------------------------------------------------------
class TriangleArea(Board):
    def construct(self):
        u = 0.78
        w, h = 6 * u, 4 * u
        center = np.array([-3.2, 0.15, 0])
        BL = center + np.array([-w / 2, -h / 2, 0])
        BR = BL + RIGHT * w
        TR = BL + RIGHT * w + UP * h
        TL = BL + UP * h

        rect = Polygon(BL, BR, TR, TL, color=CHALK, stroke_width=SW)
        l6 = T("base 6", 36).next_to(rect, DOWN, buff=0.2)
        l4 = T("height 4", 36).rotate(PI / 2).next_to(rect, LEFT, buff=0.2)
        self.play(Create(rect), run_time=0.7)
        self.play(FadeIn(l6), FadeIn(l4), run_time=0.35)

        diag = Line(BL, TR, color=CHALK, stroke_width=SW)
        self.play(Create(diag), run_time=0.45)

        tri = Polygon(BL, BR, TR, stroke_color=YELLOW_C, stroke_width=SW,
                      fill_color=YELLOW_C, fill_opacity=0.45)
        self.play(FadeIn(tri), run_time=0.5)

        x0 = 0.15
        t1 = fit(T("A triangle is half\nof a rectangle", 44, YELLOW_C), 6.2)
        t1.move_to([x0, 2.1, 0], aligned_edge=LEFT)
        self.play(Write(t1), run_time=0.8)

        t2 = fit(T("Area = ½ × 6 × 4 = 12", 46), 6.2)
        t2.move_to([x0, 0.55, 0], aligned_edge=LEFT)
        self.play(Write(t2), run_time=0.8)

        # grid of unit squares (faint)
        squares = VGroup()
        for row in range(4):
            for col in range(6):
                sq = Square(side_length=u, stroke_color=CHALK, stroke_width=2,
                            stroke_opacity=0.35, fill_opacity=0)
                sq.move_to(BL + np.array([(col + 0.5) * u, (row + 0.5) * u, 0]))
                squares.add(sq)
        self.play(FadeIn(squares), tri.animate.set_fill(opacity=0.2), run_time=0.45)

        # highlight 12 squares (half the rectangle) with counts
        hl = VGroup()
        nums = VGroup()
        k = 0
        for row in range(2):
            for col in range(6):
                k += 1
                sq = squares[row * 6 + col]
                hl.add(sq.copy().set_stroke(CYAN_C, 3, 0.9).set_fill(CYAN_C, 0.35))
                nums.add(T(str(k), 22, CHALK).move_to(sq))
        self.play(LaggedStart(*[AnimationGroup(FadeIn(s), FadeIn(n))
                                for s, n in zip(hl, nums)], lag_ratio=0.25),
                  run_time=1.3)

        t3 = fit(T("12 square units\nof space inside", 44, CYAN_C), 6.2)
        t3.move_to([x0, -1.6, 0], aligned_edge=LEFT)
        self.play(Write(t3), run_time=0.7)
        self.wait(2.6)


# ---------------------------------------------------------------------------
def check_mark(color=GREEN_C, size=0.7):
    pts = [np.array([-0.5, 0.0, 0]), np.array([-0.15, -0.38, 0]), np.array([0.55, 0.5, 0])]
    m = VMobject(stroke_color=color, stroke_width=11)
    m.set_points_as_corners([p * size for p in pts])
    return m


class NumberLineCheck(Board):
    def construct(self):
        top_y = 2.45
        s2a, sp, s2b, se = T("2", 72), T("+", 72), T("2", 72), T("=", 72)
        s5 = T("5", 72, PINK_C)
        sq = T("?", 72, PINK_C)
        top = VGroup(s2a, sp, s2b, se, s5, sq).arrange(RIGHT, buff=0.32).move_to([0, top_y, 0])
        self.play(Write(top), run_time=0.6)

        unit = 1.75
        y = -0.9
        x0 = -3 * unit
        line = Line([x0 - 0.35, y, 0], [x0 + 6 * unit + 0.35, y, 0], color=CHALK, stroke_width=SW)
        ticks = VGroup(*[Line([x0 + i * unit, y - 0.18, 0], [x0 + i * unit, y + 0.18, 0],
                              color=CHALK, stroke_width=SW - 1) for i in range(7)])
        nums = VGroup(*[T(str(i), 40).move_to([x0 + i * unit, y - 0.6, 0]) for i in range(7)])
        self.play(Create(line), Create(ticks), FadeIn(nums), run_time=0.7)

        dot = Dot([x0, y, 0], radius=0.16, color=ORANGE_C)
        self.play(GrowFromCenter(dot), run_time=0.25)

        for start in (0, 2):
            p0 = np.array([x0 + start * unit, y, 0])
            p1 = np.array([x0 + (start + 2) * unit, y, 0])
            hop = ArcBetweenPoints(p0, p1, angle=-PI * 0.75, color=ORANGE_C, stroke_width=SW)
            plus = T("+2", 40, ORANGE_C).next_to(hop, UP, buff=0.12)
            self.play(Create(hop), MoveAlongPath(dot, hop), FadeIn(plus), run_time=0.75)

        four_pos = np.array([x0 + 4 * unit, y, 0])
        ring = Circle(radius=0.42, color=CYAN_C, stroke_width=SW).move_to(nums[4])
        big4 = T("4", 96, CYAN_C).move_to(four_pos + DOWN * 1.75)
        self.play(Create(ring), nums[4].animate.set_color(CYAN_C), FadeIn(big4, shift=UP * 0.3),
                  run_time=0.5)

        cross = VGroup(
            Line(s5.get_corner(DL) + DL * 0.1, s5.get_corner(UR) + UR * 0.1, color=PINK_C, stroke_width=9),
            Line(s5.get_corner(UL) + UL * 0.1, s5.get_corner(DR) + DR * 0.1, color=PINK_C, stroke_width=9),
        )
        self.play(Create(cross), FadeOut(sq), run_time=0.45)

        new4 = T("4", 72, CYAN_C)
        chk = check_mark()
        tail = VGroup(new4, chk).arrange(RIGHT, buff=0.35)
        tail.next_to(s5, RIGHT, buff=0.45)
        tail.align_to(s5, DOWN)
        chk.shift(UP * 0.05)
        full = VGroup(top[:5], cross, tail)
        shift = -full.get_center()[0]
        self.play(VGroup(s2a, sp, s2b, se, s5, cross).animate.shift(RIGHT * shift),
                  TransformFromCopy(big4, new4.shift(RIGHT * shift)),
                  run_time=0.6)
        chk.shift(RIGHT * shift)
        self.play(Create(chk), run_time=0.35)
        self.wait(2.6)
