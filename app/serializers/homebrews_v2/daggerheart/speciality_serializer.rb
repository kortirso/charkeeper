# frozen_string_literal: true

module HomebrewsV2
  module Daggerheart
    class SpecialitySerializer < ApplicationSerializer
      attributes :id, :features, :info, :domains

      def domains
        default = ::Daggerheart::Character.domains
        object.info.domains.map do |domain|
          next translate(default.dig(domain, 'name')) if default[domain]

          translate(::Daggerheart::Homebrews::Domain.find_by(id: domain)&.title)
        end
      end

      def features
        return [] unless context
        return [] unless context[:features]

        relation = context[:features]
        Panko::ArraySerializer.new(
          relation,
          each_serializer: HomebrewsV2::Daggerheart::FeatSerializer
        ).serialize(relation)
      end
    end
  end
end
