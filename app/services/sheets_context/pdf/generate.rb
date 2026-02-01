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

        document = SheetsContext::Pdf::Daggerheart::Template.new(page_size: 'A4', page_layout: :portrait, margin: 0)
        pdf_data = document.to_pdf(character: character.decorator(version: '0.4.5'), phtml: phtml(document))

        add_data_to_template(pdf, pdf_data)
      end

      def dnd5_pdf(character)
        pdf = CombinePDF.load Rails.root.join('app/services/sheets_context/pdf/dnd/template.pdf')

        document = SheetsContext::Pdf::Dnd5::Template.new(page_size: 'A4', page_layout: :portrait, margin: 0)
        pdf_data = document.to_pdf(character: character.decorator(version: '0.4.5'), phtml: phtml(document))

        add_data_to_template(pdf, pdf_data)
      end

      def dnd2024_pdf(character)
        pdf = CombinePDF.load Rails.root.join('app/services/sheets_context/pdf/dnd/template.pdf')

        document = SheetsContext::Pdf::Dnd2024::Template.new(page_size: 'A4', page_layout: :portrait, margin: 0)
        pdf_data = document.to_pdf(character: character.decorator(version: '0.4.5'), phtml: phtml(document))

        add_data_to_template(pdf, pdf_data)
      end

      def pathfinder2_pdf(character)
        pdf = CombinePDF.load Rails.root.join('app/services/sheets_context/pdf/pathfinder2/template.pdf')

        document = SheetsContext::Pdf::Pathfinder2::Template.new(page_size: 'A4', page_layout: :portrait, margin: 0)
        pdf_data = document.to_pdf(character: character.decorator(version: '0.4.5'), phtml: phtml(document))

        add_data_to_template(pdf, pdf_data)
      end

      def add_data_to_template(pdf, pdf_data)
        parsed_pdf = CombinePDF.parse(pdf_data)
        pdf.pages.each.with_index do |page, index|
          page << parsed_pdf.pages[index]
        end
        pdf
      end

      def phtml(document)
        phtml = PrawnHtml::Instance.new(document)
        css = <<~CSS
          ul { margin-left: -16px }
        CSS
        phtml.append(css: css)
        phtml
      end
    end
  end
end
