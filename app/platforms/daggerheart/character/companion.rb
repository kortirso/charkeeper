# frozen_string_literal: true

module Daggerheart
  class Character
    class CompanionData
      include StoreModel::Model

      attribute :damage, :string, default: 'd6'
      attribute :distance, :string, default: 'melee'
      attribute :experience, array: true, default: {}
      attribute :stress_marked, :integer, default: 0
      attribute :stress_max, :integer, default: 3
      attribute :evasion, :integer, default: 10
      attribute :leveling,
                array: true,
                default: {
                  'intelligent' => 0, 'light' => 0, 'comfort' => 0, 'armored' => 0, 'vicious' => 0, 'recilient' => 0,
                  'bonded' => 0, 'aware' => 0
                }
    end

    class Companion < Character::Companion
      attribute :data, Daggerheart::Character::CompanionData.to_type
    end
  end
end
