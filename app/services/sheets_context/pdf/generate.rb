# frozen_string_literal: true

module SheetsContext
  module Pdf
    class Generate
      def call(character:)
        case character.class.name
        when 'Daggerheart::Character' then daggerheart_pdf(character).to_pdf
        when 'Dnd5::Character' then dnd5_pdf(character).to_pdf
        when 'Dnd2024::Character' then dnd2024_pdf(character).to_pdf
        when 'Pathfinder2::Character' then pathfinder2_pdf(character).to_pdf
        end
      end

      private

      def daggerheart_pdf(character)
        pdf = CombinePDF.load Rails.root.join('app/services/sheets_context/pdf/daggerheart/template.pdf')

        pdf_data =
          SheetsContext::Pdf::Daggerheart::Template.new(
            page_size: 'A4', page_layout: :portrait, margin: 0
          ).to_pdf(character: character.decorator)

        pdf.pages.each do |page|
          page << CombinePDF.parse(pdf_data).pages[0]
        end

        pdf
      end

      def dnd5_pdf(character)
        pdf = CombinePDF.load Rails.root.join('app/services/sheets_context/pdf/dnd/template.pdf')

        pdf_data =
          SheetsContext::Pdf::Dnd5::Template.new(
            page_size: 'A4', page_layout: :portrait, margin: 0
          ).to_pdf(character: character.decorator)

        pdf.pages.each do |page|
          page << CombinePDF.parse(pdf_data).pages[0]
        end

        pdf
      end

      def dnd2024_pdf(character)
        pdf = CombinePDF.load Rails.root.join('app/services/sheets_context/pdf/dnd/template.pdf')

        pdf_data =
          SheetsContext::Pdf::Dnd2024::Template.new(
            page_size: 'A4', page_layout: :portrait, margin: 0
          ).to_pdf(character: character.decorator)

        pdf.pages.each do |page|
          page << CombinePDF.parse(pdf_data).pages[0]
        end

        pdf
      end

      def pathfinder2_pdf(character)
        pdf = CombinePDF.load Rails.root.join('app/services/sheets_context/pdf/pathfinder2/template.pdf')

        pdf_data =
          SheetsContext::Pdf::Pathfinder2::Template.new(
            page_size: 'A4', page_layout: :portrait, margin: 0
          ).to_pdf(character: character.decorator)

        pdf.pages.each do |page|
          page << CombinePDF.parse(pdf_data).pages[0]
        end

        pdf
      end
    end
  end
end
