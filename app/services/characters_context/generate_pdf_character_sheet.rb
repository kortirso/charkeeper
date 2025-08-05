# frozen_string_literal: true

module CharactersContext
  class GeneratePdfCharacterSheet
    def call(character:)
      case character.class.name
      when 'Daggerheart::Character' then daggerheart_pdf(character).to_pdf
      end
    end

    private

    def daggerheart_pdf(character)
      pdf = CombinePDF.load Rails.root.join('app/services/characters_context/daggerheart/template.pdf')

      pdf_data = CharactersContext::Daggerheart::GeneratePdfCharacterSheet.new(
        page_size: CharactersContext::Daggerheart::GeneratePdfCharacterSheet::PAGE_SIZE,
        page_layout: CharactersContext::Daggerheart::GeneratePdfCharacterSheet::PAGE_LAYOUT
      ).to_pdf(
        character: character.decorator
      )

      pdf.pages.each do |page|
        page << CombinePDF.parse(pdf_data).pages[0]
      end

      pdf.save "#{character.name}.pdf"
      pdf
    end
  end
end
