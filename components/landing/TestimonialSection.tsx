import React from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah",
    role: "Computer Science Student",
    image: "/testimonials/student1.jpg",
    quote:
      "The grade visualization helped me identify patterns in my academic performance that I hadn't noticed before.",
    stars: 5,
  },
  {
    name: "Michael",
    role: "Engineering Student",
    image: "/testimonials/student2.jpg",
    quote:
      "Being able to track grades across multiple devices has been particularly useful for my university courses.",
    stars: 5,
  },
  {
    name: "Emma",
    role: "Biology Student",
    image: "/testimonials/student3.jpg",
    quote:
      "The weighted grade calculations give me a much clearer picture of where I stand in each class.",
    stars: 4,
  },
];

export function TestimonialSection() {
  return (
    <section className="container mx-auto px-4 py-20 md:py-32">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          User Experiences
        </h2>
        <p className="text-lg text-muted-foreground">
          How students are using Grade Tracker in their academic life
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <Card key={index} className="bg-card border-border overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative h-12 w-12 rounded-full overflow-hidden bg-muted">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold">{testimonial.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>

              <div className="flex mb-4">
                <Quote className="h-5 w-5 text-primary/60 mr-2" />
              </div>

              <blockquote className="text-muted-foreground">
                {testimonial.quote}
              </blockquote>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
