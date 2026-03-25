# frozen_string_literal: true

module SheetsContext
  module Pdf
    module Dnd2024
      class Template < SheetsContext::Pdf::Dnd::Template
        def to_pdf(character:, phtml: nil)
          super

          render
        end

        private

        def heritage(character)
          [subrace(character) || race(character), background(character)].compact.join(' / ')
        end

        def classes(character)
          character.parent.subclass_names.map do |key, values|
            next "#{key} #{values[:level]}" if values[:subclass].nil?

            "#{key} #{values[:level]} (#{values[:subclass]})"
          end.join(' / ')
        end

        def race(character)
          default = ::Dnd2024::Character.species_info(character.data.species)
          default ? translate(default['name']) : ::Dnd2024::Homebrew::Race.find(character.data.species).name
        end

        def subrace(character)
          return unless character.legacy

          translate(::Dnd2024::Character.legacy_info(character.species, character.legacy)['name'])
        end

        def background(character)
          return unless character.background

          translate(::Dnd2024::Character.backgrounds.dig(character.background, 'name'))
        end
      end
    end
  end
end
