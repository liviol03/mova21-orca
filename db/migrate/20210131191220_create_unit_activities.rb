class CreateUnitActivities < ActiveRecord::Migration[6.0]
  def change
    create_table :unit_activities, id: false do |t|
      t.references :unit, null: false, foreign_key: true
      t.references :activity, null: false, foreign_key: true
      t.integer :prio, null: true

      t.timestamps
    end
  end
end
