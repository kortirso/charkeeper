# frozen_string_literal: true

module Pathfinder2
  class Character
    class PetData
      include StoreModel::Model

      attribute :kind, :string, default: 'pet' # pet, familiar
      attribute :health, :integer, default: 1
      attribute :health_temp, :integer, default: 0
      attribute :selected_feats, array: true, default: []
    end

    class Pet < Character::Companion
      attribute :data, Pathfinder2::Character::PetData.to_type
    end
  end
end
