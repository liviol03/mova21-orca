class ActivityEvent < ApplicationRecord
  extend Mobility

  translates :title, type: :string, locale_accessors: true, fallbacks: true
end
