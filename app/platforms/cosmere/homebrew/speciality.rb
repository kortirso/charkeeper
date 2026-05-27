# frozen_string_literal: true

module Cosmere
  module Homebrew
    class SpecialityData
      include StoreModel::Model

      attribute :names, array: true, default: {}
      attribute :descriptions, array: true, default: {}
    end

    class Speciality < ::Homebrew::Speciality
      attribute :data, Cosmere::Homebrew::SpecialityData.to_type
    end
  end
end
