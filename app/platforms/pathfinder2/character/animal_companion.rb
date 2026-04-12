# frozen_string_literal: true

module Pathfinder2
  class Character
    class AnimalCompanionData
      include StoreModel::Model

      attribute :kind, :string
      attribute :age, :string, default: 'young'
      attribute :speeds, array: true, default: {}
      attribute :abilities, array: true, default: { 'str' => 0, 'dex' => 0, 'con' => 0, 'int' => 0, 'wis' => 0, 'cha' => 0 }
      attribute :selected_skills, array: true, default: { 'acrobatics' => 1, 'athletics' => 1 }
      attribute :weapon_skills, array: true, default: { 'unarmed' => 1 }
      attribute :armor_skills, array: true, default: { 'unarmored' => 1, 'animal' => 1 }
      attribute :saving_throws, array: true, default: { 'fortitude' => 1, 'reflex' => 1, 'will' => 1 }
      attribute :perception, :integer, default: 1
      attribute :size, :string, default: 'small'
      attribute :vision, :string, default: nil
      attribute :health, :integer, default: 4
      attribute :health_temp, :integer, default: 0
    end

    class AnimalCompanion < Character::Companion
      attribute :data, Pathfinder2::Character::AnimalCompanionData.to_type
    end
  end
end
