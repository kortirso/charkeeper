class ChangeHbTypes < ActiveRecord::Migration[8.1]
  def up
    Homebrew::Book::Item
      .where(itemable_type: [
        'Daggerheart::Homebrews::Transformation', 'Daggerheart::Homebrews::Ancestry', 'Daggerheart::Homebrews::Community',
        'Daggerheart::Homebrews::Speciality', 'Daggerheart::Homebrews::Subclass', 'Daggerheart::Homebrews::Domain',
        'Dnd2024::Homebrews::Background'
      ]).update_all(itemable_type: 'Homebrew')
  end

  def down; end
end
