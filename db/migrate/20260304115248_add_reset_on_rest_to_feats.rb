class AddResetOnRestToFeats < ActiveRecord::Migration[8.1]
  def up
    add_column :feats, :reset_on_rest, :integer, limit: 2, comment: 'Сбрасывать выбор на отдыхе'

    Daggerheart::Feat.find_by(slug: 'elemental_incarnation')&.update(reset_on_rest: 0)
  end

  def down
    remove_column :feats, :reset_on_rest
  end
end
