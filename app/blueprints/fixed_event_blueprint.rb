class FixedEventBlueprint < Blueprinter::Base
  identifier :id

  fields :starts_at, :ends_at, :title
end
