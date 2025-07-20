# frozen_string_literal: true

module Frontend
  class HomebrewsController < Frontend::BaseController
    before_action :find_daggerheart_heritages
    before_action :find_daggerheart_classes

    def index
      render handlers: [:props], layout: 'props'
    end

    private

    def find_daggerheart_heritages
      @daggerheart_heritages = ::Daggerheart::Homebrew::Race.where(user_id: current_user.id).each_with_object({}) do |item, acc|
        acc[item.id] = { name: { en: item.name, ru: item.name } }
      end
    end

    def find_daggerheart_classes
      @daggerheart_classes =
        ::Daggerheart::Homebrew::Speciality.where(user_id: current_user.id).each_with_object({}) do |item, acc|
          acc[item.id] = { name: { en: item.name, ru: item.name } }
        end
    end
  end
end
