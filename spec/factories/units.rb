# frozen_string_literal: true

# == Schema Information
#
# Table name: units
#
#  id                              :bigint           not null, primary key
#  abteilung                       :string
#  district                        :string
#  ends_at                         :datetime
#  expected_participants_f         :integer
#  expected_participants_leitung_f :integer
#  expected_participants_leitung_m :integer
#  expected_participants_m         :integer
#  language                        :string
#  limesurvey_token                :string
#  midata_data                     :jsonb
#  starts_at                       :datetime
#  stufe                           :string
#  title                           :string
#  week                            :string
#  created_at                      :datetime         not null
#  updated_at                      :datetime         not null
#  al_id                           :bigint
#  coach_id                        :bigint
#  kv_id                           :integer
#  lagerleiter_id                  :bigint           not null
#  pbs_id                          :integer
#
# Indexes
#
#  index_units_on_al_id           (al_id)
#  index_units_on_coach_id        (coach_id)
#  index_units_on_lagerleiter_id  (lagerleiter_id)
#
# Foreign Keys
#
#  fk_rails_...  (al_id => leaders.id)
#  fk_rails_...  (coach_id => leaders.id)
#  fk_rails_...  (lagerleiter_id => leaders.id)
#
FactoryBot.define do
  factory :unit, aliases: %i[camp_unit] do
    sequence(:pbs_id) { |n| n }
    title { Faker::Movies::StarWars.planet }
    abteilung { Faker::Company.name }
    kv_id { Kv.predefined.sample.pbs_id }
    stufe { Unit.stufen.keys.sample }
    expected_participants_f { (10..20).to_a.sample }
    expected_participants_m { (10..20).to_a.sample }
    expected_participants_leitung_f { (2..10).to_a.sample }
    expected_participants_leitung_m { (2..10).to_a.sample }
    starts_at { Faker::Date.in_date_period(year: 2021, month: 7) }
    ends_at { Faker::Date.in_date_period(year: 2021, month: 8) }
    al { build(:user).leader }
    lagerleiter { build(:user).leader }
  end
end
