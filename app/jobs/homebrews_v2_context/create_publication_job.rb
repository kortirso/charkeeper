# frozen_string_literal: true

module HomebrewsV2Context
  class CreatePublicationJob < ApplicationJob
    queue_as :default

    def perform(id:)
      publication = ::Homebrew::Publication.find_by(id: id)
      return unless publication

      define_locale(publication)
      HomebrewsV2Context::Publications::PerformService.new.call(publication: publication)
    end

    private

    def define_locale(publication)
      publication_locale = publication.user.locale&.to_sym || :en
      I18n.locale = I18n.available_locales.include?(publication_locale) ? publication_locale : I18n.default_locale
    end
  end
end
