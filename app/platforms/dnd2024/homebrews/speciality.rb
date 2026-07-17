# frozen_string_literal: true

module Dnd2024
  module Homebrews
    class SpecialityData
      include StoreModel::Model
    end

    class Speciality < ::Homebrew
      attribute :info, Dnd2024::Homebrews::SpecialityData.to_type
    end
  end
end
