# frozen_string_literal: true

module FalloutCharacter
  class BaseDecorator < SimpleDelegator
    delegate :data, to: :__getobj__
    delegate :abilities, :tag_skills, :level, :perks, to: :data

    def method_missing(method, *args) # rubocop: disable Lint/UnusedMethodArgument
      __getobj__.respond_to?(method.to_sym) ? __getobj__.public_send(method) : nil
    end

    def perk_ranks
      slugs = Fallout::Feat.where(id: perks.keys).pluck(:id, :slug).to_h
      perks.transform_keys { |key| slugs[key] }
    end
  end
end
