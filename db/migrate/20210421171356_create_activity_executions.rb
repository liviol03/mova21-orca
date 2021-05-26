class CreateActivityExecutions < ActiveRecord::Migration[6.0]
  def change
    create_table :activity_executions do |t|
      t.references :activity, null: false, foreign_key: true
      t.datetime :starts_at
      t.datetime :ends_at
      t.integer :language_flags

      t.timestamps
    end
  end
end
