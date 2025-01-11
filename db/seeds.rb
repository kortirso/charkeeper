# frozen_string_literal: true

Rule.create!(name: 'D&D 3')
Rule.create!(name: 'D&D 3.5')
Rule.create!(name: 'D&D 4')
dnd5 = Rule.create!(name: 'D&D 5')
Rule.create!(name: 'D&D 5 2024')
Rule.create!(name: 'Pathfinder')
Rule.create!(name: 'Pathfinder 2')
Rule.create!(name: 'Daggerheart')

user = User.create!

dnd5.characters.create!(
  user: user,
  name: 'Kormak',
  data: {
    race: 'dward',
    alignment: 'neutral',
    abilities: { str: 16, dex: 12, con: 14, int: 9, wis: 8, cha: 12 },
    classes: { warrior: 1 }
  }
)
