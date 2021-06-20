class ActivityExecutionBlueprint < Blueprinter::Base
  identifier :id

  fields :languages, :starts_at, :ends_at, :amount_participants, :transport, :spot

  association :field, blueprint: FieldBlueprint
  association :spot, blueprint: SpotBlueprint
  field :languages do |activity_execution|
    activity_execution.languages.select { |_language, available| available}.keys.map { |lang| lang.to_s.sub('language_', '') }
  end
end
