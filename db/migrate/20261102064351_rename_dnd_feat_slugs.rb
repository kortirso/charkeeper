class RenameDndFeatSlugs < ActiveRecord::Migration[8.1]
  def change
    Dnd2024::Feat
      .find_by(slug: 'wild_resurgence', title: { 'en' => 'Wild Resurgence', 'ru' => 'Природный маг' })
      &.update(slug: 'nature_magician', title: { 'en' => 'Nature Magician', 'ru' => 'Природный маг' })

    Dnd2024::Feat
      .find_by(slug: 'words_of_creation', title: { 'en' => 'Words of Creation', 'ru' => 'Друидический язык' })
      &.update(slug: 'druidic', title: { 'en' => 'Druidic', 'ru' => 'Друидический язык' })

    Dnd2024::Feat
      .find_by(slug: 'boon_of_combat_prowess', title: { 'en' => 'Boon of Spell Recall', 'ru' => 'Дар восстановления чар' })
      &.update(slug: 'boon_of_spell_recall')

    Dnd2024::Feat
      .find_by(slug: 'boon_of_combat_prowess', title: { 'en' => 'Boon of Combat Prowess', 'ru' => 'Дар судьбы' })
      &.update(slug: 'boon_of_fate', title: { 'en' => 'Boon of Fate', 'ru' => 'Дар судьбы' })

    if Dnd2024::Feat.where(slug: 'repelling_blast').count > 1
      Dnd2024::Feat.find_by(slug: 'repelling_blast').destroy
    end

    if Dnd2024::Feat.where(slug: 'nature_sanctuary').count > 1
      Dnd2024::Feat.find_by(slug: 'nature_sanctuary').destroy
    end

    if Dnd2024::Feat.where(slug: 'natural_recovery_2').count > 1
      Dnd2024::Feat.find_by(slug: 'natural_recovery_2').destroy
    end
  end
end
