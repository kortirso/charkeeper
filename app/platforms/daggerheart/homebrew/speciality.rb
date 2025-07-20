# frozen_string_literal: true

module Daggerheart
  module Homebrew
    class SpecialityData
      include StoreModel::Model

      attribute :evasion, :integer, default: 10
      attribute :health_max, :integer, default: 6
      attribute :domains, array: true, default: []
    end

    class Speciality < ::Homebrew::Speciality
      attribute :data, Daggerheart::Homebrew::SpecialityData.to_type
    end
  end
end
