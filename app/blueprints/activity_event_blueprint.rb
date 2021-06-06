class ActivityExecutionBlueprint < Blueprinter::Base
  identifier :id

  fields :activity_id, :languages, :starts_at

  field :languages do |activity_execution|
    activity_execution.languages.select { |_language, available| available}.keys.map { |lang| lang.to_s.sub('language_', '') }
  end
end
