class AcitvityExecutionSerializer < ActiveModel::Serializer
  attributes :id, :activity_id, :languages, :starts_at, :ends_at

  def languages
    object.languages
  end
end
