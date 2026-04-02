# frozen_string_literal: true

module Pathfinder2
  class Character
    class AnimalCompanionData
      include StoreModel::Model
    end

    class AnimalCompanion < Character::Companion
      attribute :data, Pathfinder2::Character::AnimalCompanionData.to_type
    end
  end
end
