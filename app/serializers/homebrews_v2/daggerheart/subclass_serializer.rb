# frozen_string_literal: true

module HomebrewsV2
  module Daggerheart
    class SubclassSerializer < ApplicationSerializer
      attributes :id, :features, :info, :class_name

      def class_name
        default = ::Daggerheart::Character.classes_info
        class_id = object.info.class_id
        translate(
          default[class_id] ? default.dig(class_id, 'name') : ::Daggerheart::Homebrews::Speciality.find_by(id: class_id)&.title
        )
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
