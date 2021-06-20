FactoryBot.define do
  factory :activity_execution do
    activity
    starts_at { Faker::Date.between(from: 2.days.ago, to: Date.today) }
    amount_participants { Faker::Number.between(from: 0, to: 30) }
    transport { true }
    language_flags { activity.language_flags }
    add_attribute(:field) { create(:field) }
    ends_at { starts_at + ((1..14).to_a.sample).hours }
  end
end
