# frozen_string_literal: true

module Daggerheart
  module Homebrews
    class SpecialityData
      include StoreModel::Model

      attribute :evasion, :integer, default: 10
      attribute :health_max, :integer, default: 6
      attribute :domains, array: true, default: []
    end

    class Speciality < ::Homebrew
      attribute :info, Daggerheart::Homebrews::SpecialityData.to_type

      def to_json
        [
          {
            title: title,
            description: description,
            public: attributes['public'],
            domains: info.domains,
            evasion: info.evasion,
            health_max: info.health_max,
            features: Daggerheart::Feat.where(origin_value: id).map { _1.to_json }
          }
        ]
      end
    end
  end
end
