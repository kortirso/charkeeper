# frozen_string_literal: true

module Frontend
  class HomebrewsController < Frontend::BaseController
    before_action :find_dnd2024_races
    before_action :find_daggerheart_heritages
    before_action :find_daggerheart_communities
    before_action :find_daggerheart_classes
    before_action :find_daggerheart_subclasses

    def index
      render handlers: [:props], layout: 'props'
    end

    private

    def find_dnd2024_races
      @dnd2024_races = ::Dnd2024::Homebrew::Race.where(user_id: current_user.id).each_with_object({}) do |item, acc|
        acc[item.id] = { name: { en: item.name, ru: item.name }, legacies: {}, sizes: item.data.size }
      end
    end

    def find_daggerheart_heritages
      @daggerheart_heritages = ::Daggerheart::Homebrew::Race.where(user_id: current_user.id).each_with_object({}) do |item, acc|
        acc[item.id] = { name: { en: item.name, ru: item.name } }
      end
    end

    def find_daggerheart_communities
      @daggerheart_communities =
        ::Daggerheart::Homebrew::Community.where(user_id: current_user.id).each_with_object({}) do |item, acc|
          acc[item.id] = { name: { en: item.name, ru: item.name } }
        end
    end

    def find_daggerheart_classes
      @daggerheart_classes =
        ::Daggerheart::Homebrew::Speciality.where(user_id: current_user.id).each_with_object({}) do |item, acc|
          acc[item.id] = { name: { en: item.name, ru: item.name }, domains: item.data.domains }
        end
    end

    def find_daggerheart_subclasses
      @daggerheart_subclasses =
        ::Daggerheart::Homebrew::Subclass.where(user_id: current_user.id).each_with_object({}) do |item, acc|
          acc[item.class_name] ||= {}
          acc[item.class_name][item.id] = { name: { en: item.name, ru: item.name }, spellcast: item.data.spellcast }
        end
    end
  end
end
