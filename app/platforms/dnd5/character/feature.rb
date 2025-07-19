# frozen_string_literal: true

module Dnd5
  class Character
    class Feature < ApplicationRecord
      self.table_name = :dnd5_character_features

      RACE_ORIGIN = 'race'
      SUBRACE_ORIGIN = 'subrace'
      CLASS_ORIGIN = 'class'
      SUBCLASS_ORIGIN = 'subclass'

      # STATIC = 'static'
      # TEXT = 'text'
      # ONE_FROM_LIST = 'one_from_list' # рендерится список, выбирается одно значение
      # MANY_FROM_LIST = 'many_from_list' # рендерится список, выбирается несколько значений
      # UPDATE_RESULT = 'update_result' # не рендерится, обновляются данные декоратора

      STATIC = 'static' # рендерится текст
      STATIC_LIST = 'static_list' # рендерится список, выбирается одно значение
      DYNAMIC_LIST = 'dynamic_list' # рендерится список, выбирается несколько значений
      CHOOSE_FROM = 'choose_from' # рендерится динамический список, выбирается несколько значений
      CHOOSE_ONE_FROM = 'choose_one_from' # рендерится динамический список, выбирается одно значение
      TEXT = 'text' # рендерится текст, вводится текст
      UPDATE_RESULT = 'update_result' # не рендерится, обновляются данные декоратора

      SHORT_REST = 'short_rest'
      LONG_REST = 'long_rest'

      enum :origin, { RACE_ORIGIN => 0, SUBRACE_ORIGIN => 1, CLASS_ORIGIN => 2, SUBCLASS_ORIGIN => 3 }
      enum :kind, {
        STATIC => 0, STATIC_LIST => 1, DYNAMIC_LIST => 2, CHOOSE_FROM => 3, TEXT => 4, UPDATE_RESULT => 5, CHOOSE_ONE_FROM => 6
      }
      enum :limit_refresh, { SHORT_REST => 0, LONG_REST => 1 }
    end
  end
end
