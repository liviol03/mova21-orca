class SpotBlueprint < Blueprinter::Base
  identifier :id

  fields :name

  association :fields, blueprint: FieldBlueprint
end
