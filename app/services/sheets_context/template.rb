# frozen_string_literal: true

module SheetsContext
  class Template < Prawn::Document
    # rubocop: disable Metrics/AbcSize
    def to_pdf(character:)
      font Rails.root.join('app/assets/fonts/Roboto-Regular.ttf') do
        font_size 12
        fill_color 'FFFFFF'
        text_box character.name, at: [30, 812], width: 180

        font_size 6
        text_box I18n.t('services.sheets_context.level'), at: [531, 784], width: 40, align: :center

        font_size 8
        fill_color '000000'
        text_box heritage(character), at: [270, 814], width: 230
        text_box classes(character), at: [270, 795], width: 230
      end

      font Rails.root.join('app/assets/fonts/CascadiaMono-SemiLight.otf')
      stroke_color '000000'

      font_size 14
      text_box character.level.to_s, at: [533, 808], width: 37, height: 18, align: :center
    end
    # rubocop: enable Metrics/AbcSize
  end
end
