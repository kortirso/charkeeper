# frozen_string_literal: true

module SheetsContext
  module Pdf
    module Dnd5
      class Template < SheetsContext::Pdf::Dnd::Template
        def to_pdf(character:)
          super

          render
        end

        private

        def heritage(...)
          ''
        end

        def classes(...)
          ''
        end
      end
    end
  end
end
