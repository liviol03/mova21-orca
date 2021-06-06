class CreateActivityEvents < ActiveRecord::Migration[6.0]
  def change
    create_table :activity_events do |t|
      t.jsonb :title, default: {}
      t.datetime :starts_at
      t.datetime :ends_at

      t.timestamps
    end
  end
end
