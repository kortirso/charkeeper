# frozen_string_literal: true

module Dnd5
  class Character
    class Feature < ApplicationRecord
      self.table_name = :dnd5_character_features

      RACE_ORIGIN = 'race'
      SUBRACE_ORIGIN = 'subrace'
      CLASS_ORIGIN = 'class'
      SUBCLASS_ORIGIN = 'subclass'

      STATIC = 'static' # рендерится текст
      STATIC_LIST = 'static_list' # рендерится список, выбирается одно значение
      DYNAMIC_LIST = 'dynamic_list' # рендерится список, выбирается несколько значений
      CHOOSE_FROM = 'choose_from' # рендерится динамический список, выбирается несколько значений
      TEXT = 'text' # рендерится текст, вводится текст
      UPDATE_RESULT = 'update_result' # не рендерится, обновляются данные декоратора

      enum :origin, { RACE_ORIGIN => 0, SUBRACE_ORIGIN => 1, CLASS_ORIGIN => 2, SUBCLASS_ORIGIN => 3 }
      enum :kind, { STATIC => 0, STATIC_LIST => 1, DYNAMIC_LIST => 2, CHOOSE_FROM => 3, TEXT => 4, UPDATE_RESULT => 5 }
    end
  end
end
