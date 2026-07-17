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
          [subrace(character) || race(character), character.parent.background_name].compact.join(' / ')
        end

        def classes(character)
          character.parent.subclass_names.map do |key, values|
            next "#{key} #{values[:level]}" if values[:subclass].nil?

            "#{key} #{values[:level]} (#{values[:subclass]})"
          end.join(' / ')
        end

        def race(character)
          character.parent.species_name
        end

        def subrace(character)
          return unless character.legacy

          translate(::Dnd2024::Character.legacy_info(character.species, character.legacy)['name'])
        end
      end
    end
  end
end
