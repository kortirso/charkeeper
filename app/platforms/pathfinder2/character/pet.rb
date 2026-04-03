# frozen_string_literal: true

module Pathfinder2
  class Character
    class PetData
      include StoreModel::Model

      attribute :kind, :string, default: 'pet' # pet, familiar
      attribute :selected_features, array: true, default: []
    end

    class Pet < Character::Companion
      attribute :data, Pathfinder2::Character::PetData.to_type
    end
  end
end
