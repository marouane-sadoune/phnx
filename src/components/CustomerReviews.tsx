import { Star, MessageSquare } from "lucide-react";

export const CustomerReviews = () => {
  return (
    <section className="w-full px-6 md:px-10 py-16 bg-secondary">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-wide text-foreground mb-4">
          What Our Customers Say
        </h2>
        <p className="text-muted-foreground mb-10">
          Real reviews from real customers.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl p-6 flex flex-col items-center gap-3"
            >
              <MessageSquare className="h-8 w-8 text-muted-foreground/30" />
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className="h-4 w-4 text-muted-foreground/20"
                  />
                ))}
              </div>
              <p className="text-muted-foreground text-sm italic">
                No reviews yet
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
